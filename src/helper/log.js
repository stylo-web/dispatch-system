async function createLog({ user, action, target_collection, target_id, metadata }) {
    await Log.create({
        user_id: user._id,
        company_id: user.company_id || null,
        role: user.role,
        action,
        target_collection,
        target_id,
        metadata
    });
}

export default createLog;