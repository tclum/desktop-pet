// Platform-specific abstractions. Add logic here before calling into mac.rs / windows.rs.

#[cfg(target_os = "macos")]
mod mac;

#[cfg(target_os = "windows")]
mod windows;
