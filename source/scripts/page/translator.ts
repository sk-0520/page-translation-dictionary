import * as config from '../config';
import * as logging from '../logging';
import * as names from '../names';
import * as type from '../type';

const logger = logging.create('translator');

class MatchResult {
	//#region variable

	private _matched: boolean;
	private _regex: RegExp | null;

	//#endregion

	private constructor(matched: boolean, regex: RegExp | null) {
		this._matched = matched;
		this._regex = regex;
	}

	//#region property

	public get matched(): boolean {
		return this._matched;
	}

	public get isRegex(): boolean {
		return this._regex !== null;
	}

	public get regex(): RegExp {
		if (!this._regex) {
			throw new Error('regex');
		}

		return this._regex;
	}

	//#endregion


	//#region function

	public static none(): MatchResult {
		return new MatchResult(false, null);
	}

	public static matchedPlain(): MatchResult {
		return new MatchResult(true, null);
	}

	public static matchedRegex(regex: RegExp): MatchResult {
		return new MatchResult(true, regex);
	}

	//#endregion
}

//ITargetConfiguration
function filterText(input: string, filterConfiguration: config.IFilterConfiguration): string {
	//TODO: フィルタ処理
	return input;
}

function matchText(input: string, matchConfiguration: config.IMatchConfiguration): MatchResult {
	switch (matchConfiguration.mode) {
		case config.MatchMode.Partial:
			let index = -1;
			if (matchConfiguration.ignoreCase) {
				index = input.toLowerCase().indexOf(matchConfiguration.pattern.toLowerCase());
			} else {
				index = input.indexOf(matchConfiguration.pattern);
			}
			if (index !== -1) {
				return MatchResult.matchedPlain();
			}
			return MatchResult.none();

		case config.MatchMode.Regex:
			const flags = matchConfiguration.ignoreCase ? 'mi' : 'm';
			try {
				const regex = new RegExp(matchConfiguration.pattern, flags);
				if (regex.test(input)) {
					return MatchResult.matchedRegex(regex);
				}
			} catch (ex) {
				logger.warn(ex);
			}
			return MatchResult.none();

		case config.MatchMode.Forward:
			if (matchConfiguration.ignoreCase) {
				if (input.toLowerCase().startsWith(matchConfiguration.pattern.toLowerCase())) {
					return MatchResult.matchedPlain();
				}
			} else {
				if (input.startsWith(matchConfiguration.pattern)) {
					return MatchResult.matchedPlain();
				}
			}
			return MatchResult.none();

		case config.MatchMode.Backward:
			if (matchConfiguration.ignoreCase) {
				if (input.toLowerCase().endsWith(matchConfiguration.pattern.toLowerCase())) {
					return MatchResult.matchedPlain();
				}
			} else {
				if (input.endsWith(matchConfiguration.pattern)) {
					return MatchResult.matchedPlain();
				}
			}
			return MatchResult.none();

		case config.MatchMode.Perfect:
			if (matchConfiguration.ignoreCase) {
				if (input.toLowerCase() === matchConfiguration.pattern.toLowerCase()) {
					return MatchResult.matchedPlain();
				}
			} else {
				if (input === matchConfiguration.pattern) {
					return MatchResult.matchedPlain();
				}
			}
			return MatchResult.none();

		default:
			return MatchResult.none();
	}
}

function replace(source: string, targetConfiguration: config.ITargetConfiguration, siteConfiguration: config.ISiteConfiguration): string | null {
	const inputText = filterText(source, targetConfiguration.filter);

	const replaceMode = targetConfiguration.replace.mode ?? config.ReplaceMode.Normal;

	if (targetConfiguration.match) {
		const matchResult = matchText(inputText, targetConfiguration.match);
		if (!matchResult.matched) {
			return null;
		}

		if (matchResult.isRegex) {
			try {
				logger.debug('I: ', targetConfiguration.replace.value);

				// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/replace#%E8%A7%A3%E8%AA%AC
				const result = inputText.replace(matchResult.regex, targetConfiguration.replace.value);

				return result;

			} catch (e) {
				logger.error('catch --> ' + e);
			}
		}
	}

	switch (replaceMode) {
		case config.ReplaceMode.Normal:
			return targetConfiguration.replace.value;

		case config.ReplaceMode.Common:
			if (siteConfiguration.common && siteConfiguration.common.text) {
				const text = siteConfiguration.common.text[targetConfiguration.replace.value];
				if (text) {
					return text;
				} else {
					logger.warn(`common.text.${targetConfiguration.replace.value} is null`);
				}
			} else {
				logger.warn('common[.text] is null');
			}
			return null;

		default:
			throw new Error('not impl: ReplaceMode -> ' + replaceMode);
	}
}

function translateElement(element: Element, queryConfiguration: config.IQueryConfiguration, siteConfiguration: config.ISiteConfiguration): boolean {
	let translated = false;

	if (queryConfiguration.attributes) {
		for (const [attributeName, targetConfiguration] of Object.entries(queryConfiguration.attributes)) {
			const sourceValue = element.getAttribute(attributeName);
			if (sourceValue) {
				const output = replace(sourceValue, targetConfiguration, siteConfiguration);
				if (output) {
					element.setAttribute(attributeName, output);
					element.setAttribute(names.Attributes.attributeHead + attributeName, sourceValue);
					translated = true;
				}
			}
		}
	}

	if (type.isInputElement(element) && queryConfiguration.value) {
		const sourceValue = element.value;
		const output = replace(sourceValue, queryConfiguration.value, siteConfiguration);
		if (output) {
			element.value = output;
			element.setAttribute(names.Attributes.value, sourceValue);
			translated = true;
		}
	} else if (element.textContent && queryConfiguration.text) {

		const nodes = new Map<number, Text | Element>();

		if (queryConfiguration.selector.node) {
			const textNodes = new Array<Text>();
			for (const node of element.childNodes) {
				if (node instanceof Text) {
					textNodes.push(node);
				}
			}

			if (queryConfiguration.selector.node === -1 && queryConfiguration.text.match) {
				// 全てのテキストノードを対象とする(条件設定は必須)
				for (let i = 0; i < textNodes.length; i++) {
					nodes.set(i + 1, textNodes[i]);
				}
			} else if ((queryConfiguration.selector.node - 1) < textNodes.length) {
				const node = textNodes[queryConfiguration.selector.node - 1];
				nodes.set(queryConfiguration.selector.node, node);
			}
		}

		if (!nodes.size) {
			nodes.set(0, element);
		}
		for (const [number, node] of nodes) {
			const sourceValue = node.textContent || '';

			const output = replace(sourceValue, queryConfiguration.text, siteConfiguration);
			if (output) {
				if (node instanceof Text) {
					node.textContent = output;
				} else {
					element.textContent = output;
				}
				element.setAttribute(names.Attributes.textHead + number, sourceValue);
				translated = true;
			}
		}
	}

	if (translated) {
		element.setAttribute(names.Attributes.translated, '');
	}

	return translated;
}

function translateCore(queryConfiguration: config.IQueryConfiguration, siteConfiguration: config.ISiteConfiguration, translateConfiguration: config.ITranslateConfiguration): void {
	logger.debug('query:', queryConfiguration);

	const currentSelectors = queryConfiguration.selector.mode === config.SelectorMode.Common
		? siteConfiguration.common.selector[queryConfiguration.selector.value]
		: queryConfiguration.selector.value
		;

	const elements = new Array<Element>();

	if (queryConfiguration.selector.all) {
		const elementList = document.querySelectorAll(currentSelectors);
		elements.push(...elementList);
	} else {
		const element = document.querySelector(currentSelectors);
		if (element) {
			elements.push(element);
		}
	}
	if (!elements.length) {
		logger.debug('selector not match:', currentSelectors)
		return;
	}

	for (const element of elements) {
		if (translateElement(element, queryConfiguration, siteConfiguration)) {
			if (translateConfiguration.markReplacedElement) {
				element.classList.add(names.ClassNames.mark);
			}
		}
	}

}

export function translate(pathConfiguration: config.IPathConfiguration, siteConfiguration: config.ISiteConfiguration, translateConfiguration: config.ITranslateConfiguration): void {

	for (const queryConfiguration of pathConfiguration.query) {
		translateCore(queryConfiguration, siteConfiguration, translateConfiguration);
	}

	for (const name of pathConfiguration.import) {
		if (name in siteConfiguration.common.query) {
			const queryConfiguration = siteConfiguration.common.query[name];
			translateCore(queryConfiguration, siteConfiguration, translateConfiguration);
		}
	}
}
