import mermaid from 'mermaid';

try {
  await mermaid.parse('graph TD; A-->B;');
  console.log('Success');
} catch (e) {
  console.error(e);
}
