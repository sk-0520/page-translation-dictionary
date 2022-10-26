import * as config from './config';

/**
 * 要素は `HTMLInputElement` か。
 * @param element
 * @returns
 */
export function isInputElement(element: Element): element is HTMLInputElement {
	return element.tagName === 'INPUT';
}

export function isTranslateConfiguration(obj: any): obj is config.ITranslateConfiguration {
	return obj
		&& 'markReplacedElement' in obj && typeof obj.markReplacedElement === 'boolean'
		;
}

export function isApplicationConfiguration(obj: any): obj is config.IApplicationConfiguration {
	return obj
		&& 'translate' in obj && isTranslateConfiguration(obj.translate)
		;
}

export function isSiteHeadConfiguration(obj: any): obj is config.ISiteHeadConfiguration {
	return obj
		&& 'id' in obj && typeof obj.id === 'string'
		&& 'updateUrl' in obj && typeof obj.updateUrl === 'string'
		&& 'updatedTimestamp' in obj && typeof obj.updatedTimestamp === 'string'
		&& 'name' in obj && typeof obj.name === 'string'
		&& 'version' in obj && typeof obj.version === 'string'
		&& 'hosts' in obj && Array.isArray(obj.hosts)
		&& 'level' in obj && typeof obj.level === 'number'
		&& 'language' in obj && typeof obj.language === 'string'
		;
}