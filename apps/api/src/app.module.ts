import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { FilesModule } from "./files/files.module";
import { ImagesModule } from "./images/images.module";
import { LinksModule } from "./links/links.module";
import { NotesModule } from "./notes/notes.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RemindersModule } from "./reminders/reminders.module";
import { SearchModule } from "./search/search.module";
import { ToolsModule } from "./tools/tools.module";
import { WorkflowsModule } from "./workflows/workflows.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    NotesModule,
    ImagesModule,
    FilesModule,
    LinksModule,
    RemindersModule,
    SearchModule,
    AiModule,
    WorkflowsModule,
    ToolsModule
  ]
})
export class AppModule {}
