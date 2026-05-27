function parseFamScript(text) {
  const nodeMap = new Map();
  const relations = [];
  const parseErrors = [];

  const lines = text.split('\n');
  let currentPerson = null;
  let lineNum = 0;

  for (const rawLine of lines) {
    lineNum++;
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('%')) continue;

    const parts = line.split(/\s+/);
    const keyword = parts[0].toUpperCase();

    switch (keyword) {
      case 'PERSON': {
        if (currentPerson) {
          if (currentPerson.id) nodeMap.set(currentPerson.id, currentPerson);
        }
        const id = parts[1] || '';
        if (!id) {
          parseErrors.push(`Line ${lineNum}: PERSON missing ID`);
        }
        currentPerson = { id, name: '', age: null, gender: '', generation: '', status: '' };
        break;
      }

      case 'NAME':
        if (currentPerson) currentPerson.name = parts.slice(1).join(' ');
        break;

      case 'AGE':
        if (currentPerson) {
          const age = parseInt(parts[1], 10);
          currentPerson.age = isNaN(age) ? null : age;
        }
        break;

      case 'GENDER':
        if (currentPerson) currentPerson.gender = (parts[1] || '').toUpperCase();
        break;

      case 'GEN':
        if (currentPerson) currentPerson.generation = parts[1] || '';
        break;

      case 'STATUS':
        if (currentPerson) currentPerson.status = parts.slice(1).join(' ');
        break;

      case 'RELATION': {
        if (currentPerson) {
          if (currentPerson.id) nodeMap.set(currentPerson.id, currentPerson);
          currentPerson = null;
        }
        if (parts.length < 4) {
          parseErrors.push(`Line ${lineNum}: RELATION requires FROM TYPE TO`);
        } else {
          relations.push({ from: parts[1], to: parts[3], type: parts[2].toUpperCase() });
        }
        break;
      }

      default:
        break;
    }
  }

  if (currentPerson && currentPerson.id) {
    nodeMap.set(currentPerson.id, currentPerson);
  }

  return { nodes: Array.from(nodeMap.values()), relations, parseErrors };
}
