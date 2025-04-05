import { Controller, Get } from "@nestjs/common";

@Controller("v1/health")
export class HealthController {
    @Get()
    run() {
        return { status: "ok" };
    }
}