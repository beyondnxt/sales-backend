import { Injectable, Scope } from '@nestjs/common';

@Injectable({scope:Scope.REQUEST})
export class RequestService {
    private userId: any;

    setUserId(userId: any) {
        this.userId = userId
    }
    getUserId() {
        return this.userId;
    }
}