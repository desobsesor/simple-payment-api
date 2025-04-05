import { execSync } from "node:child_process";
import * as path from "node:path";

import fs from "fs-extra";

const REPORTS_PATH = path.resolve(process.cwd(), ".nyc_output");
const COVERAGE_PATH = path.resolve(process.cwd(), "coverage");

fs.ensureDirSync(REPORTS_PATH);
fs.ensureDirSync(COVERAGE_PATH);
fs.ensureDirSync(`${COVERAGE_PATH}/global`);

fs.emptyDirSync(REPORTS_PATH);
try {
    if (fs.existsSync(`${COVERAGE_PATH}/unit/coverage-final.json`)) {
        fs.copyFileSync(
            `${COVERAGE_PATH}/unit/coverage-final.json`,
            `${REPORTS_PATH}/unit-coverage.json`
        );
    } else {
        console.error('Coverage file not found');
    }

    if (fs.existsSync(`${COVERAGE_PATH}/e2e/coverage-final.json`)) {
        fs.copyFileSync(
            `${COVERAGE_PATH}/e2e/coverage-final.json`,
            `${REPORTS_PATH}/e2e-coverage.json`
        );
    } else {
        console.error('Coverage e2e file not found');
    }

    execSync(`nyc report --report-dir ${COVERAGE_PATH}/global`, {
        stdio: "inherit",
    });
} catch (error) {
    console.error('Error to process coverage files');
    process.exit(1);
}