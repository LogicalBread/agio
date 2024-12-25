/**
 * personality/*.json を読み込み、target.ts を生成 (Bun を使用)
 * 生成される target.ts は、以下のような形式 (hello.json / world.json / japan.json がある場合)
 * export enum PersonalTarget = {
 *   Hello = 0,
 *   World = 1,
 *   Japan = 2,
 * };
 *
 * const targets = {
 *  [PersonalTarget.Hello]: 'hello.json',
 *  [PersonalTarget.World]: 'world.json',
 *  [PersonalTarget.Japan]: 'japan.json',
 * };
 */

import { glob } from 'glob';
import { writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getGlobFiles = (pattern: string): string[] => {
  return glob.sync(pattern);
};

const generateEnumAndMapping = (files: string[]): string => {
  const entries = files.map((file) => ({
    name: capitalize(basename(file, '.json')),
    path: `${basename(file, '.json')}.json`,
  }));

  const imports = entries.map(
    ({ name, path }) => `import ${name}Json from '../../personality/${path}'`,
  );

  const enumValues = entries.map(
    ({ name }) => `  ${name} = '${name.toLowerCase()}'`,
  );

  const mappingValues = entries.map(
    ({ name }) => `  [PersonalTarget.${name}]: ${name}Json`,
  );

  return `${imports.join('\n')}

export enum PersonalTarget {
${enumValues.join(',\n')}
}

export const targets = {
${mappingValues.join(',\n')}
};

export const targetFromStr = (str: string): PersonalTarget | undefined => {
  switch (str.toLowerCase()) {
${entries
  .map(
    ({ name }) =>
      `    case '${name.toLowerCase()}': return PersonalTarget.${name};`,
  )
  .join('\n')}
    default: return undefined;
  }
};
`;
};

const generateTargetTypes = (pattern: string, outputPath: string): void => {
  const files = getGlobFiles(pattern).filter(
    (file) => !file.includes('example'),
  );
  const code = generateEnumAndMapping(files);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, code);
};

generateTargetTypes('personality/*.json', 'src/gen/target.ts');
