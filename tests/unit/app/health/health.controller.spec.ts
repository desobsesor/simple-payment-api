import { HealthController } from '../../../../src/app/health/health.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
        }).compile();

        controller = module.get<HealthController>(HealthController);
    });

    describe('run', () => {
        it('should return status ok', () => {
            const result = controller.run();

            expect(result).toEqual({ status: 'ok' });
        });
    });
});