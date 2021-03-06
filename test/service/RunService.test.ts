import 'mocha';
import { BootstrapService, BootstrapUtils, Preset, StartParams } from '../../src/service';
import { RunService } from '../../src/service';
import { expect } from 'chai';
import { existsSync } from 'fs';
import { join } from 'path';

describe('RunService', () => {
    const target = 'target/BootstrapService.standard';

    it('healthCheck', async () => {
        const bootstrapService = new BootstrapService('.');
        const config: StartParams = {
            report: false,
            preset: Preset.bootstrap,
            reset: false,
            target,
            detached: true,
            build: false,
            user: 'current',
            timeout: 1200,
        };

        await bootstrapService.config(config);

        await bootstrapService.compose(config);

        const service = new RunService({ ...config });
        try {
            await service.healthCheck(500);
        } catch (e) {
            expect(e.message).to.equal('Network did NOT start!!!');
            return;
        }
        throw new Error('This should fail!');
    });

    it('resetData', async () => {
        const bootstrapService = new BootstrapService('.');
        const config: StartParams = {
            report: false,
            preset: Preset.bootstrap,
            reset: false,
            target,
            detached: true,
            build: false,
            user: 'current',
            timeout: 1200,
        };

        const configResult = await bootstrapService.config(config);
        await bootstrapService.compose(config);

        const nodeDataFolder = BootstrapUtils.getTargetNodesFolder(target, false, configResult.presetData.nodes![0].name, 'data');
        expect(existsSync(nodeDataFolder)).eq(true);
        BootstrapUtils.deleteFolder(nodeDataFolder);
        expect(existsSync(nodeDataFolder)).eq(false);
        const service = new RunService({ ...config });
        await service.resetData();
        expect(existsSync(join(nodeDataFolder, '00000', '00001.dat'))).eq(true);
    });
});
