mod database;
mod routes;
mod templates;

use axum::{routing::{get, post}, Extension, Router};
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("No .env file found");

    serve().await;
}

async fn initialize() -> Router {
    let db_file = std::env::var("DB_FILE").expect("Environment variable 'DB_FILE' not set.");

    // initialize new database or load existing
    let db = crate::database::Database::new(format!("sqlite://{}", db_file)).await;

    // cors

    Router::new()
    .route("/", get(routes::get_root))
    .route("/p/:id", get(routes::get_paste))
    .route("/archive", get(routes::get_archive))
    .route("/settings", get(routes::get_settings))
    .route("/api/paste", post(routes::create_paste))
    .layer(Extension(db))
    .fallback_service(ServeDir::new("www"))
}

async fn serve() {
    let host = std::env::var("HOST").expect("Environment variable 'HOST' not set.");
    let port = std::env::var("PORT").expect("Environment variable 'PORT' not set.");

    let app = initialize().await;
    let listener = TcpListener::bind(format!("{host}:{port}")).await.unwrap();

    println!("Server listening on: {}:{}", host, port);
    axum::serve(listener, app).await.unwrap();
}