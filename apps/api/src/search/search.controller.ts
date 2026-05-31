import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { RequestUser } from "../common/request-user";
import { SearchService } from "./search.service";

@Controller("search")
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@CurrentUser() user: RequestUser, @Query("q") q?: string) {
    return this.searchService.search(user.id, q);
  }
}
