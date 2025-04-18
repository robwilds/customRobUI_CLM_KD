export const ProjectTreeGroupNodeType = {
    processAutomation: 'process_automation',
    forms: 'forms',
    content: 'content',
    idp: 'idp',
};
export type ProjectTreeGroupNodeType = typeof ProjectTreeGroupNodeType[keyof typeof ProjectTreeGroupNodeType];
