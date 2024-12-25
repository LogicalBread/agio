export type Personal = {
  /** 名前 */
  name: string;
  /** User との関係 */
  relationFromUser: string;
  /** 人格 */
  personals: string[];
  /** 発言 */
  proposals: string[];
};

export const personalToSystemPrompt = (
  personal: Personal,
  userName: string,
): string => {
  return `
    あなたは「${personal.name}」です。
    以下は全て「${personal.name}」の情報です。彼をシミュレートし、その後の会話を行ってください。
    User との関係は${personal.relationFromUser}です。
    User の名前は${userName}です。

    ### 人格
    ${personal.personals.join('\n')}
    ### 発言
    ${personal.proposals.join('\n')}
  `;
};
