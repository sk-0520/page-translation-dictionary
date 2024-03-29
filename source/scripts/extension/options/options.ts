import webextension from "webextension-polyfill";

import * as dom from '../../core/dom';
import * as types from '../../core/types';
import * as number from '../../core/number';
import * as localize from '../localize';
import * as storage from '../storage';
import * as config from '../config';
import * as url from '../../core/url';
import * as loader from '../loader';
import ImportLogger from './ImportLogger';
import license from './license.json';
import * as extensions from '../extensions';

import '../../../styles/extension/application-options.scss';

function setApplication(applicationConfiguration: config.ApplicationConfiguration) {
	dom.requireElementById('translate_markReplacedElement', HTMLInputElement).checked = applicationConfiguration.translate.markReplacedElement;

	dom.requireElementById('setting_autoUpdate', HTMLInputElement).checked = applicationConfiguration.setting.autoUpdate;
	dom.requireElementById('setting_updatedBeforeTranslation', HTMLInputElement).checked = applicationConfiguration.setting.updatedBeforeTranslation;
	dom.requireElementById('setting_periodDays', HTMLInputElement).value = applicationConfiguration.setting.periodDays.toString();
}

function updateItemInformation(siteHeadConfiguration: config.SiteHeadConfiguration, itemRootElement: Element | DocumentFragment) {
	dom.requireSelector(itemRootElement, '[name="name"]').textContent = siteHeadConfiguration.name;
	dom.requireSelector(itemRootElement, '[name="version"]').textContent = siteHeadConfiguration.version;

	const currentStateElement = dom.requireSelector(itemRootElement, '[name="state_current"]', HTMLElement);
	setState(currentStateElement, siteHeadConfiguration.isEnabled);

	const updatedTimestampElement = dom.requireSelector(itemRootElement, '[name="updated-timestamp"]', HTMLTimeElement);
	updatedTimestampElement.dateTime = siteHeadConfiguration.updatedTimestamp;
	updatedTimestampElement.textContent = new Date(siteHeadConfiguration.updatedTimestamp).toLocaleString();
	const hostsElement = dom.requireSelector(itemRootElement, '[name="hosts"]');
	dom.clearContent(hostsElement);
	for (const host of siteHeadConfiguration.hosts) {
		const hostRootElement = dom.cloneTemplate('#template-setting-item-host');

		const hostElement = dom.requireSelector(hostRootElement, '[name="host"]');
		hostElement.textContent = host;

		hostsElement.appendChild(hostRootElement);
	}

	const details = [
		{ name: 'update-url', url: siteHeadConfiguration.updateUrl },
		{ name: 'website-url', url: siteHeadConfiguration.information.websiteUrl },
		{ name: 'repository-url', url: siteHeadConfiguration.information.repositoryUrl },
		{ name: 'document-url', url: siteHeadConfiguration.information.documentUrl },
	];
	for (const detail of details) {
		const detailElement = dom.requireSelector<HTMLAnchorElement>(itemRootElement, `[name="${detail.name}"]`);

		if (url.isHttpUrl(detail.url)) {
			detailElement.href = detail.url;
			detailElement.target = `${detail.name}_${siteHeadConfiguration.id}`
			detailElement.textContent = detail.url;
		} else {
			dom.requireClosest(detailElement, 'tr').remove();
		}
	}
}

function setState(currentStateElement: HTMLElement, isEnabled: boolean): void {
	const messageName = isEnabled
		? dom.getDataset(currentStateElement, 'enabled')
		: dom.getDataset(currentStateElement, 'disabled')
		;
	const message = webextension.i18n.getMessage(messageName);
	currentStateElement.textContent = message;
}

function addSetting(applicationConfiguration: config.ApplicationConfiguration, siteHeadConfiguration: config.SiteHeadConfiguration) {
	const itemRootElement = dom.cloneTemplate('#template-setting-item');
	localize.applyNestElements(itemRootElement);

	dom.requireSelector(itemRootElement, '.setting-item', HTMLElement).dataset['head'] = JSON.stringify(siteHeadConfiguration);

	dom.requireSelector(itemRootElement, '[name="editor"]').addEventListener('click', async ev => {
		ev.preventDefault();

		const editorUri = webextension.runtime.getURL('setting-editor.html');
		webextension.tabs.create({
			url: editorUri + '?setting=' + siteHeadConfiguration.id,
		})
	});

	const stateElement = dom.requireSelector(itemRootElement, '[name="state"]', HTMLButtonElement);
	stateElement.addEventListener('click', async ev => {
		ev.preventDefault();

		const element = ev.currentTarget as HTMLButtonElement;
		const itemElement = dom.requireClosest(element, '.setting-item', HTMLElement);

		const currentSiteHeadConfiguration = JSON.parse(itemElement.dataset['head']!) as config.SiteHeadConfiguration;

		const heads = await storage.loadSiteHeadsAsync();
		const index = heads.findIndex(i => i.id === currentSiteHeadConfiguration.id);
		if (index < 0) {
			throw new Error(currentSiteHeadConfiguration.id);
		}
		const head = heads[index];
		head.isEnabled = !head.isEnabled;

		await storage.saveSiteHeadsAsync(heads);

		itemElement.dataset['head'] = JSON.stringify(head);
		updateItemInformation(head, itemElement);
	});

	const updateElement = dom.requireSelector(itemRootElement, '[name="update"]', HTMLButtonElement);
	if (siteHeadConfiguration.updateUrl) {
		updateElement.addEventListener('click', async ev => {
			ev.preventDefault();
			const element = ev.currentTarget as HTMLButtonElement;
			const itemElement = dom.requireClosest(element, '.setting-item', HTMLElement);
			const currentSiteHeadConfiguration = JSON.parse(itemElement.dataset['head']!);
			element.disabled = true;
			const prev = element.textContent;
			try {
				element.textContent = element.dataset['updating']!;

				const setting = await loader.fetchAsync(currentSiteHeadConfiguration.updateUrl);
				if (!setting) {
					return;
				}

				const site = await loader.saveAsync(currentSiteHeadConfiguration.updateUrl, setting, siteHeadConfiguration.id, siteHeadConfiguration.isEnabled);
				itemElement.dataset['head'] = JSON.stringify(site.head);
				updateItemInformation(site.head, itemElement);
			} finally {
				element.disabled = false;
				element.textContent = prev;
			}
		}, false);
	} else {
		updateElement.disabled = true;
	}

	dom.requireSelector(itemRootElement, '[name="id"]').textContent = siteHeadConfiguration.id;

	const nextUpdateElement = dom.requireSelector(itemRootElement, '[name="next-update"]', HTMLTimeElement);
	const lastCheckedTimestamp = new Date(siteHeadConfiguration.lastCheckedTimestamp)
	lastCheckedTimestamp.setDate(lastCheckedTimestamp.getDate() + applicationConfiguration.setting.periodDays);
	nextUpdateElement.title = nextUpdateElement.dateTime = lastCheckedTimestamp.toISOString();
	nextUpdateElement.textContent = lastCheckedTimestamp.toLocaleString();

	dom.requireSelector(itemRootElement, '[name="delete"]').addEventListener('click', async ev => {
		const element = ev.currentTarget as HTMLButtonElement;
		const itemElement = dom.requireClosest(element, '.setting-item');
		itemElement.remove();

		const heads = await storage.loadSiteHeadsAsync();
		const targetHeads = heads.filter(i => i.id === siteHeadConfiguration.id);
		const removedHeads = heads.filter(i => i.id !== siteHeadConfiguration.id);
		await storage.saveSiteHeadsAsync(removedHeads);
		for (const head of targetHeads) {
			await storage.deleteSiteBodyAsync(head.id);
		}
	});
	updateItemInformation(siteHeadConfiguration, itemRootElement);

	const settingsElement = dom.requireElementById('settings');
	settingsElement.appendChild(itemRootElement);

}

async function importSettingAsync(applicationConfiguration: config.ApplicationConfiguration, settingUrl: string): Promise<void> {
	const log = new ImportLogger();
	log.clear();

	try {
		log.add(webextension.i18n.getMessage('options_import_log_start'));

		if (!url.isHttpUrl(settingUrl)) {
			log.add(webextension.i18n.getMessage('options_import_log_invalid_url'));
			return;
		}

		const existsId = await loader.hasSiteSettingAsync(settingUrl);
		if (existsId !== null) {
			log.add(webextension.i18n.getMessage('options_import_log_duplicated', existsId));
			return;
		}

		log.add(webextension.i18n.getMessage('options_import_log_fetch_url', [settingUrl]));
		const setting = await loader.fetchAsync(settingUrl);
		if (!setting) {
			log.add(webextension.i18n.getMessage('options_import_log_invalid_setting'));
			return;
		}

		log.add(webextension.i18n.getMessage('options_import_log_setting', [setting.name, setting.version]));
		for (const host of setting.hosts) {
			log.add(webextension.i18n.getMessage('options_import_log_host', [host]));
		}

		// 内部用データとして取り込み
		log.add(webextension.i18n.getMessage('options_import_log_convert'));

		const site = await loader.saveAsync(settingUrl, setting, null, true);

		log.add(webextension.i18n.getMessage('options_import_log_success'));

		addSetting(applicationConfiguration, site.head);

	} catch (ex) {
		if (ex instanceof Error) {
			log.add(ex.toString());
		} else {
			log.add(ex + '');
		}
	}
}

function setSettings(applicationConfiguration: config.ApplicationConfiguration, siteHeadConfigurations: ReadonlyArray<config.SiteHeadConfiguration>) {
	for (const siteHeadConfiguration of siteHeadConfigurations) {
		addSetting(applicationConfiguration, siteHeadConfiguration);
	}

	dom.requireElementById('import').addEventListener('click', async ev => {
		ev.preventDefault();
		const url = prompt(webextension.i18n.getMessage('options_import_message'));
		if (url === null) {
			return;
		}
		await importSettingAsync(applicationConfiguration, url);
	})
}

function setLibraries() {
	const libraryItemsElement = dom.requireElementById('library-items', HTMLTableSectionElement);
	const itemTemplateElement = dom.requireElementById('template-library-item', HTMLTemplateElement);

	const getKeys = <T extends object>(json: T): Array<keyof T> => Object.keys(json).sort() as Array<keyof T>;
	//const names = Object.keys(license).sort() as Array<keyof license>;
	const names = getKeys(license);
	for (const name of names) {
		const itemsElement = dom.cloneTemplate(itemTemplateElement);

		const value = license[name];

		const libraryElement = dom.requireSelector(itemsElement, '[name="library"]', HTMLAnchorElement);
		libraryElement.textContent = value.module;
		libraryElement.href = value.repository;

		const licenseElement = dom.requireSelector(itemsElement, '[name="license"]');
		licenseElement.textContent = value.licenses;

		const publisherElement = dom.requireSelector(itemsElement, '[name="publisher"]');
		publisherElement.textContent = types.getPropertyOr(value, 'publisher', '');

		libraryItemsElement.appendChild(itemsElement);
	}

}

async function saveGenericAsync(): Promise<void> {
	const applicationConfiguration = await storage.loadApplicationAsync();

	applicationConfiguration.translate.markReplacedElement = dom.requireElementById('translate_markReplacedElement', HTMLInputElement).checked;

	applicationConfiguration.setting.autoUpdate = dom.requireElementById('setting_autoUpdate', HTMLInputElement).checked;
	applicationConfiguration.setting.updatedBeforeTranslation = dom.requireElementById('setting_updatedBeforeTranslation', HTMLInputElement).checked;

	const rawPeriodDays = dom.requireElementById('setting_periodDays', HTMLInputElement).value;
	applicationConfiguration.setting.periodDays = number.parseIntOr(rawPeriodDays, Math.trunc(applicationConfiguration.setting.periodDays));

	console.log(applicationConfiguration);

	await storage.saveApplicationAsync(applicationConfiguration);
}

async function bootAsync(extension: extensions.Extension): Promise<void> {
	const applicationTask = storage.loadApplicationAsync();
	const siteHeadsTask = storage.loadSiteHeadsAsync();

	localize.applyView();
	document.title = webextension.i18n.getMessage('options_title', webextension.i18n.getMessage('ext_name'));
	dom.requireSelector('label[for="options_tab_header_about"]').textContent = webextension.i18n.getMessage('options_tab_header_about', webextension.i18n.getMessage('ext_name'));

	const application = await applicationTask;
	setApplication(application);

	let siteHeads = await siteHeadsTask;
	siteHeads = siteHeads.sort((a, b) => {
		if (a.name === b.name) {
			return a.name.localeCompare(b.name);
		}

		return a.id.localeCompare(b.id);
	});

	setSettings(application, siteHeads);

	setLibraries();

	dom.requireElementById('create-setting').addEventListener('click', ev => {
		ev.preventDefault();

		const editorUri = webextension.runtime.getURL('setting-editor.html');
		webextension.tabs.create({
			url: editorUri,
		})
	});

	dom.requireElementById('generic').addEventListener('submit', async ev => {
		ev.preventDefault();
		await saveGenericAsync();
	})

	dom.requireElementById('options').classList.remove('loading');
	dom.requireElementById('processing').classList.add('processed');
}

export function boot(extension: extensions.Extension) {
	bootAsync(extension);
}
