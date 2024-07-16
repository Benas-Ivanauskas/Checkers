function initializeBoardState() {
  const board = [
    [null, "black", null, "black", null, "black", null, "black"],
    ["black", null, "black", null, "black", null, "black", null],
    [null, "black", null, "black", null, "black", null, "black"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["white", null, "white", null, "white", null, "white", null],
    [null, "white", null, "white", null, "white", null, "white"],
    ["white", null, "white", null, "white", null, "white", null],
  ];
  return { board };
}

module.exports = {
  initializeBoardState,
};
