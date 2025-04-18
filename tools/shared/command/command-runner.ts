/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { relative, join } from 'path';
import * as CLI from '../cli';
import * as inquirer from 'inquirer';
import logger from '../es5/logger';
import { inputParamsTable } from './decorators/param.decorators';

export type CommandLogger = logger.Logger;
export type CommandInquirer = inquirer.Inquirer;

export type BeforeRunReturnValue = Promise<null | undefined | number>;

export interface Runnable {
    run(logger: CommandLogger): Promise<void>;
    beforeRun?(inquirer: CommandInquirer, paramsProvidedFromCli: { [key: string]: any }, logger: CommandLogger): BeforeRunReturnValue;
}

export interface RunnableCommand extends Runnable {
    name: string;
    description: string;
    version?: string;
    [inputParamsTable]: { [key: string]: CLI.Param };
}

export default class CommandRunner {
    constructor(private commandFilePath: string, protected cliArgs: string[]) {}

    public async invoke(): Promise<void> {
        let command: RunnableCommand;
        try {
            command = await this.loadCommand();
        } catch (error) {
            logger.error(`Command does not exist: ${this.commandFilePath}`);
            throw error;
        }

        const everyProvidedParam = await this.getCommandParams(command);
        this.mergeParamsBackIntoCommandInstance(command, everyProvidedParam);

        await command.run(logger);
    }

    private async loadCommand(): Promise<RunnableCommand> {
        const relativeCommandPath = relative(__dirname, this.commandFilePath);
        const CommandClass = (await import(relativeCommandPath)).default;
        return new CommandClass();
    }

    private async getCommandParams(command: RunnableCommand): Promise<{ [key: string]: any }> {
        const { version } = await import(join(process.cwd(), 'package.json'));
        const cliReader = new CLI.Reader(inquirer, command.name, command.description, command.version ?? version);
        const readerGenerator = cliReader.getReader(Object.values(command[inputParamsTable] || {}), this.cliArgs);
        const paramsProvidedFromCli = (await readerGenerator.next()).value;

        if (command.beforeRun) {
            const exitStatusCode = await command?.beforeRun(inquirer, paramsProvidedFromCli, logger);

            if (exitStatusCode !== null && exitStatusCode !== undefined) {
                process.exit(exitStatusCode);
            }
        }

        return (await readerGenerator.next()).value;
    }

    private mergeParamsBackIntoCommandInstance(command: RunnableCommand, everyProvidedParam: { [key: string]: any }) {
        Object.values(command[inputParamsTable] || {}).forEach((inputParam) => {
            if (everyProvidedParam[inputParam.name] !== undefined) {
                command[inputParam.name] = everyProvidedParam[inputParam.name];
            }
        });
    }
}
