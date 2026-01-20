mod commands;
mod models;
mod services;

use services::DownloaderService;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())

        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // System commands
            commands::check_dotnet_runtime,
            commands::get_dotnet_download_url,
            commands::select_folder,
            commands::load_settings,
            commands::save_settings,
            commands::get_config_path,
            commands::search_steam_games,
            // Download commands
            commands::start_download,
            commands::add_to_history,
        ])
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Cleanup DepotDownloader processes on exit
                tokio::spawn(async {
                    let _ = DownloaderService::cleanup_processes().await;
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
