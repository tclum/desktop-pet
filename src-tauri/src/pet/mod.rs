use crate::db::PetRow;
use serde::Serialize;

/// Serializable pet state sent to the frontend on every load or interaction.
/// `seconds_since_last_interaction` is computed from stored timestamps on demand —
/// never maintained as a running value between sessions.
#[derive(Debug, Serialize)]
pub struct PetStateDto {
    pub id: i64,
    pub created_at: String,
    pub stage: String,
    pub personality: Option<String>,
    pub last_interaction_at: String,
    pub seconds_since_last_interaction: i64,
    /// Monotonically non-decreasing. Grows from interactions, never shrinks.
    pub bond: i64,
    /// False until the first-launch onboarding flow completes.
    pub has_completed_onboarding: bool,
    /// One of forest, countryside, mountain, ocean, city. NULL for pre-v8 pets.
    pub environment: Option<String>,
}

impl From<PetRow> for PetStateDto {
    fn from(row: PetRow) -> Self {
        PetStateDto {
            id: row.id,
            created_at: row.created_at,
            stage: row.stage,
            personality: row.personality,
            last_interaction_at: row.last_interaction_at,
            seconds_since_last_interaction: row.seconds_since_last_interaction,
            bond: row.bond,
            has_completed_onboarding: row.has_completed_onboarding,
            environment: row.environment,
        }
    }
}
