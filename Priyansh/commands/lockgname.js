const fs = require('fs');
const path = __dirname + '/groupNameLock.json';

function loadLocks() {
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path));
}

function saveLocks(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function isGroupNameLocked(threadID) {
  const locks = loadLocks();
  return !!locks[threadID];
}

function getLockedGroupName(threadID) {
  const locks = loadLocks();
  return locks[threadID] || null;
}

// Your existing lock command stays the same
// ...

// Add this listener to handle group name changes:
module.exports.handleEvent = async function({ api, event }) {
  // Detect if event is a group name change (depends on your framework)
  if (event.logMessageType === "log:thread-name") {
    const threadID = event.threadID;
    if (isGroupNameLocked(threadID)) {
      const lockedName = getLockedGroupName(threadID);
      const newName = event.logMessageData.name;

      if (newName !== lockedName) {
        // Revert name back to locked one
        await api.changeThreadTitle(lockedName, threadID);
        api.sendMessage(`❌ Group name is locked. Reverted to "${lockedName}".`, threadID);
      }
    }
  }
};
