import HunkGenerator from './HunkGenerator';
import Git from 'nodegit';

async function* asyncCommitIterator(repository) {
  const worker = await repository.createRevWalk();
  const refs = await repository.getReferences(Git.Reference.TYPE.OID);
  refs.forEach(ref => worker.push(ref));
  worker.pushHead();
  worker.sorting(Git.Revwalk.SORT.TOPOLOGICAL);

  let done = false;

  while(!done) {
    let oid = null;
    try {
      oid = await worker.next();
    } catch(err) {
      // for empty repository
      done = true;
    }

    if(oid != null) {
      const current = await repository.getCommit(oid);
      current.refs = refs.filter(r => { return r.target().equal(current.id()); });

      yield current;

      const oids = await current.parents();
      if(oids.length === 0) {
        done = true;
      }
    }
  }
}

export const CommitLoader = async (path, count) => {
  const repository = await Git.Repository.open(path);
  const iterator = asyncCommitIterator(repository);
  const commits = [];

  const hunkGenerator = new HunkGenerator(repository);
  const fileChanges = await hunkGenerator.getUnCommitedChanges();

  if(fileChanges.length !== 0) {
    const head = await repository.getHeadCommit();

    const commit = {
      id: () => {
        return {
          tostrS: () => { return '' }
        }
      },
      sha: () => { return '' },
      message: () => { return 'uncommitted changes' },
      date: () => { return '' },
      refs: [],
      author: () => {
        return { 
          name: () => { return '' }
        }
      },
      parents: () => {
        return [head.id()]
      },
      fileChanges: fileChanges
    }

    commits.push(commit);
  }

  return {
    load: async () => {
      for(let i=0;i<count;i++) {
        const result = await iterator.next();
        if(result.done) {
          return { value: commits, done: true };
        } else {
          commits.push(result.value);
        }
      }

      return { value: commits, done: false };
    }
  }
}

export const NullLoader = () => {
  return {
    load: async () => {
      return { value: [], done: true };
    }
  }
}
