use askama::Template;
use axum::{extract::{Path, Query}, response::Html, Extension, Form};
use serde::Deserialize;

use crate::{database::{self, Database}, templates::{ArchivePage, HomePage, PastePage, SettingsPage}};

pub(crate) async fn get_root() -> Html<String> {
    Html(HomePage {}.render().unwrap())
}

pub(crate) async fn get_paste(Extension(db): Extension<Database>, Path(id): Path<String>) -> Html<String> {
    let paste = database::Paste::from_id(&db.get_connection_pool(), id).await;

    Html(PastePage { paste }.render().unwrap())
}

#[derive(Deserialize)]
pub(crate) struct Owner {
    id: String
}

pub(crate) async fn get_archive(Extension(db): Extension<Database>, owner: Query<Owner>) -> Html<String> {
    let pastes = database::Paste::all_belonging_to(&db.get_connection_pool(), &owner.id).await;
    Html(ArchivePage { pastes }.render().unwrap())
}

pub(crate) async fn get_settings() -> Html<String> {
    Html(SettingsPage {}.render().unwrap())
}

#[derive(Debug, Deserialize)]
pub(crate) struct PasteForm {
    pub(crate) paste_owner: String,
    pub(crate) paste_content: String,
    pub(crate) paste_expiration: String,
    pub(crate) paste_password: Option<String>,
}

pub(crate) async fn create_paste(Extension(db): Extension<Database>, Form(paste): Form<PasteForm>) {
    database::Paste::new(&db.get_connection_pool(), &paste).await;
}
