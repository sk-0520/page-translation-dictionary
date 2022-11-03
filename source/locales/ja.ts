import * as locale from './locale';

const messages: locale.IMessages & locale.MessageMap = {
	we_description: {
		message: '特定の要素のテキスト(かテキストノードか属性か値)に対する辞書的置き換え処理'
	},

	options_tab_header_generic: {
		message: '基本設定',
	},
	options_tab_content_generic_translate: {
		message: '翻訳設定',
	},
	options_tab_content_generic_translate_markReplacedElement: {
		message: '置き換え部分をマークする',
	},

	options_tab_content_generic_setting: {
		message: '設定ファイル',
	},
	options_tab_content_generic_setting_autoUpdate: {
		message: '自動更新を行う',
	},
	options_tab_content_generic_setting_updatedBeforeTranslation: {
		message: '翻訳開始前に設定更新処理を行う',
	},
	options_tab_content_generic_setting_periodDays: {
		message: '自動更新期間(日)',
	},

	options_tab_content_generic_save: {
		message: '保存',
	},

	options_tab_header_settings: {
		message: '設定ファイル',
	},
	options_tab_content_settings_item: {
		message: '設定ファイル一覧',
	},
	options_tab_content_settings_item_name: {
		message: '設定名',
	},
	options_tab_content_settings_item_version: {
		message: '設定バージョン',
	},
	options_tab_content_settings_item_updatedTimestamp: {
		message: '最終更新日時(UTC)',
	},
	options_tab_content_settings_item_website: {
		message: 'Webサイト',
	},
	options_tab_content_settings_item_repository: {
		message: 'リポジトリ',
	},
	options_tab_content_settings_item_document: {
		message: 'ドキュメント',
	},
	options_tab_content_settings_item_hosts: {
		message: '有効ホスト一覧',
	},
	options_tab_content_settings_item_details: {
		message: '詳細',
	},
	options_tab_content_settings_item_details_updateUrl: {
		message: 'アップデートURL',
	},
	options_tab_content_settings_item_details_website: {
		message: 'ウェブサイト',
	},
	options_tab_content_settings_item_details_repository: {
		message: 'リポジトリ',
	},
	options_tab_content_settings_item_details_document: {
		message: 'ドキュメント',
	},
	options_tab_content_settings_item_details_id: {
		message: 'ID',
	},
	options_tab_content_settings_item_details_actions: {
		message: '処理',
	},
	options_tab_content_settings_item_details_actions_editor: {
		message: '編集',
	},
	options_tab_content_settings_item_details_actions_update: {
		message: '更新',
	},
	options_tab_content_settings_item_details_actions_updating: {
		message: '更新中',
	},
	options_tab_content_settings_item_details_actions_delete: {
		message: '削除',
	},

	options_tab_content_settings_import: {
		message: '取り込み',
	},

	options_tab_content_settings_import_submit: {
		message: '取り込み実行',
	},

	options_import_message: {
		message: '取り込みURL',
	},
	options_import_log_start: {
		message: '取り込み開始',
	},
	options_import_log_success: {
		message: '取り込み正常終了',
	},
	options_import_log_invalid_url: {
		message: 'URLが正しくない',
	},
	options_import_log_duplicated: {
		message: '既に存在する設定: $ID$',
		placeholders: {
			'ID': {
				content: '$1',
			},
		},
	},
	options_import_log_fetch_url: {
		message: '設定取得処理開始: $URL$',
		placeholders: {
			'URL': {
				content: '$1',
			},
		},
	},
	options_import_log_invalid_setting: {
		message: '設定ファイルが正しくない',
	},
	options_import_log_setting: {
		message: '設定データ取得: $NAME$ $VERSION$',
		placeholders: {
			'NAME': {
				content: '$1',
			},
			'VERSION': {
				content: '$2',
			},
		},
	},
	options_import_log_host: {
		message: '有効ホスト: $HOST$',
		placeholders: {
			'HOST': {
				content: '$1',
			},
		},
	},
	options_import_log_convert: {
		message: '変換処理開始',
	},

	editor_tab_header_editor: {
		message: 'エディタ',
	},
	editor_tab_content_editor_head: {
		message: '設定',
	},
	editor_tab_content_editor_head_name: {
		message: '名前',
	},
	editor_tab_content_editor_head_id: {
		message: '内部ID',
	},
	editor_tab_content_editor_path: {
		message: 'パス',
	},
	editor_tab_content_editor_common: {
		message: '共通',
	},

	editor_tab_header_raw: {
		message: '生データ',
	},
};

export default messages;
