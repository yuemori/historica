const nextColor = () => {
  // TODO: implement
  return "#000000";
}

export default function(commits) {
  return commits.reduce((rows, commit, index, commits) => {
    if(index === 0) {
      const row = { commit: commit, columns: [{ id: commit.id, color: nextColor() }] };
      return [row]
    }

    const previous = rows[rows.length - 1];
    const parentId = previous.commit.parentIds[0];
    const previousColumnIds = previous.columns.map(c => { return c.id; });
    const columns = previous.columns.map((column) => {
      if(column.id === previous.commit.id) {
        if(previousColumnIds.includes(parentId)) {
          return null;
        } else {
          return { id: parentId, color: nextColor() };
        }
      }
      return column;
    }).filter(c => { return c != null });

    previous.commit.parentIds.forEach((id) => {
      if(!columns.map(c => { return c.id; }).includes(id)) {
        columns.push({ id: id, color: nextColor() });
      }
    })

    const row = {
      commit: commit,
      columns: columns
    }

    return rows.concat(row);
  }, []);
}
