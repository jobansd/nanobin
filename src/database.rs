use chrono::{DateTime, Utc};
use nanoid::nanoid;
use sqlx::{migrate::MigrateDatabase, Pool, Row, Sqlite, SqlitePool};

#[derive(Clone)]
pub(crate) struct Database {
    connection_pool: Pool<Sqlite>,
}

impl Database {
    pub(crate) async fn new(db_url: String) -> Self {
        let db_file = Self {
            connection_pool: Self::init_connection_pool(&db_url).await,
        };

        db_file.initialize_db().await;
        db_file
    }

    async fn init_connection_pool(db_url: &str) -> Pool<Sqlite> {
        if Sqlite::database_exists(db_url).await.unwrap() {
            println!("Loading database: {}", db_url);
            SqlitePool::connect(db_url).await.unwrap()
        } else {
            eprintln!("Database file missing: {}", db_url);
            match Sqlite::create_database(db_url).await {
                Ok(_) => println!("Successfully created database file."),
                Err(_) => panic!("Error creating database file."),
            }

            println!("Loading database: {}", db_url);
            SqlitePool::connect(db_url).await.unwrap()
        }
    }

    async fn initialize_db(&self) {
        Self::create_pastes_table(&self.connection_pool).await;
    }

    pub(crate) fn get_connection_pool(&self) -> &Pool<Sqlite> {
        &self.connection_pool
    }

    async fn create_pastes_table(db_conn: &Pool<Sqlite>) {
        let create_users_table_query = "
        CREATE TABLE IF NOT EXISTS pastes (
            id TEXT NOT NULL UNIQUE PRIMARY KEY,
            owner TEXT NOT NULL,
            content TEXT NOT NULL,
            password_hash TEXT,
            created_at DATETIME NOT NULL DEFAULT (datetime('now', 'utc')),
            expires_at DATETIME NOT NULL DEFAULT (datetime('now', 'utc'))
        )";

        sqlx::query(create_users_table_query)
            .execute(db_conn)
            .await
            .unwrap();
    }
}

#[derive(Debug)]
pub(crate) struct Paste {
    pub(crate) id: String,
    pub(crate) owner: String,
    // pub(crate) password_hash: String,
    pub(crate) content: String,
    pub(crate) created_at: DateTime<Utc>,
    // pub(crate) expires_at: DateTime<Utc>
}

impl Paste {
    pub(crate) async fn from_id(connection_pool: &SqlitePool, id: String) -> Self {
        let mut conn = connection_pool.acquire().await.unwrap();
        let row = sqlx::query("SELECT * FROM pastes WHERE id = ?;")
            .bind(id)
            .fetch_one(&mut *conn)
            .await
            .unwrap();

        conn.close().await.unwrap();

        Paste {
            id: row.get("id"),
            owner: row.get("owner"),
            // password_hash: row.get("password_hash"),
            content: row.get("content"),
            created_at: row.get("created_at"),
            // expires_at: row.get("expires_at")
        }
    }

    pub(crate) async fn new(connection_pool: &SqlitePool, paste: &crate::routes::PasteForm) {
        let mut conn = connection_pool.acquire().await.unwrap();
        let create_paste_query = "INSERT INTO pastes (id, owner, content) VALUES (?, ?, ?)";

        let id = nanoid!(12);

        sqlx::query(create_paste_query)
            .bind(id)
            .bind(&paste.paste_owner)
            .bind(&paste.paste_content)
            .execute(&mut *conn)
            .await
            .unwrap();

        conn.close().await.unwrap();
    }

    pub(crate) async fn all_belonging_to(connection_pool: &SqlitePool, owner_id: &String) -> Vec<Self> {
        let mut conn = connection_pool.acquire().await.unwrap();
        let rows = sqlx::query("SELECT * FROM pastes WHERE owner = ?;")
            .bind(owner_id)
            .fetch_all(&mut *conn)
            .await
            .unwrap();

        conn.close().await.unwrap();

        rows.iter().map(|row| {
            Self {
                id: row.get("id"),
                owner: row.get("owner"),
                content: row.get("content"),
                created_at: row.get("created_at"),
            }
        }).collect::<Vec<Self>>()
    }
}
