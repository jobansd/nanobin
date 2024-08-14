use askama::Template;
use crate::database;

#[derive(Template)]
#[template(path = "pages/home.html")]
pub(crate) struct HomePage {}

#[derive(Template)]
#[template(path = "pages/paste.html")]
pub(crate) struct PastePage {
    pub(crate) paste: crate::database::Paste,
}

#[derive(Template)]
#[template(path = "pages/archive.html")]
pub(crate) struct ArchivePage {
    pub(crate) pastes: Vec<database::Paste>,
}

#[derive(Template)]
#[template(path = "pages/settings.html")]
pub(crate) struct SettingsPage {}
