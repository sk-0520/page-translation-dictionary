
export interface IPlaceholder {
	//#region property

	content: string,
	example?: string,

	//#endregion
}

export interface IMessage {
	//#region property

	message: string,
	description?: string,
	placeholders?: { [name: string]: IPlaceholder },

	//#endregion
}

export type MessageMap = { [name: string]: IMessage };

export interface IMessages {
	options_tab_header_generic: IMessage,

	options_tab_content_generic_translate: IMessage,
	options_tab_content_generic_translate_markReplacedElement: IMessage,

	options_tab_content_generic_setting: IMessage,
	options_tab_content_generic_setting_autoUpdate: IMessage,
	options_tab_content_generic_setting_periodDays: IMessage,

	options_tab_content_generic_save: IMessage,

	options_tab_header_defines: IMessage,

	options_tab_content_defines_import: IMessage,
	options_tab_content_defines_item_update: IMessage,
	options_tab_content_defines_item_updating: IMessage,
	options_tab_content_defines_item_name: IMessage,
	options_tab_content_defines_item_version: IMessage,
	options_tab_content_defines_item_updatedTimestamp: IMessage,
	options_tab_content_defines_item_id: IMessage,
	options_tab_content_defines_item_delete: IMessage,
	options_tab_content_defines_item_website: IMessage,
	options_tab_content_defines_item_repository: IMessage,
	options_tab_content_defines_item_document: IMessage,
	options_tab_content_defines_item_hosts: IMessage,

	options_import_message: IMessage,

	options_import_log_start: IMessage,
	options_import_log_success: IMessage,
	options_import_log_invalid_url: IMessage,
	options_import_log_duplicated: IMessage,
	options_import_log_fetch_url: IMessage,
	options_import_log_invalid_setting: IMessage,
	options_import_log_setting: IMessage,
	options_import_log_host: IMessage,
	options_import_log_convert: IMessage,
}