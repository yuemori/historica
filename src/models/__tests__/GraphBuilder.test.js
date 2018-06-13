import GraphBuilder from '../GraphBuilder'

describe('GraphBuilder', () => {
  let commits;
  let graph;
  let result;

  beforeEach(() => {
    // expected graph is
    //
    // 0
    // |
    // 1
    // |\
    // | 2
    // | |
    // | 3
    // 4/
    // |\
    // | 5
    // | |\
    // | | 6
    // | |/|
    // | 7 |
    // | | 8
    // |/ /
    // | /
    // 9

    commits = [
      { id: 0, parentIds: [1] },
      { id: 1, parentIds: [4, 2] },
      { id: 2, parentIds: [3] },
      { id: 3, parentIds: [4] },
      { id: 4, parentIds: [9, 5] },
      { id: 5, parentIds: [7, 6] },
      { id: 6, parentIds: [7, 8] },
      { id: 7, parentIds: [9] },
      { id: 8, parentIds: [9] },
      { id: 9, parentIds: [] }
    ]

    graph = [
      { commit: commits[0], columns: [{ id: 0, color: "#000000" }]},
      { commit: commits[1], columns: [{ id: 1, color: "#000000" }]},
      { commit: commits[2], columns: [{ id: 4, color: "#000000" }, { id: 2, color: "#000000" }]},
      { commit: commits[3], columns: [{ id: 4, color: "#000000" }, { id: 3, color: "#000000" }]},
      { commit: commits[4], columns: [{ id: 4, color: "#000000" }]},
      { commit: commits[5], columns: [{ id: 9, color: "#000000" }, { id: 5, color: "#000000" }]},
      { commit: commits[6], columns: [{ id: 9, color: "#000000" }, { id: 7, color: "#000000" }, { id: 6, color: "#000000" }]},
      { commit: commits[7], columns: [{ id: 9, color: "#000000" }, { id: 7, color: "#000000" }, { id: 8, color: "#000000" }]},
      { commit: commits[8], columns: [{ id: 9, color: "#000000" }, { id: 8, color: "#000000" }]},
      { commit: commits[9], columns: [{ id: 9, color: "#000000" }]}
    ]

    result = GraphBuilder(commits);
  })

  test('first node to be correct', () => {
    result.forEach((row, i) => {
      expect(row).toEqual(graph[i])
    })
  });
});
