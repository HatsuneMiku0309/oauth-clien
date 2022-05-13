import { install } from 'source-map-support';
install();
import { Express } from 'express';
import * as Koa from 'koa';
import { IError, IOapi, TAnyObj } from './index.interface';
import { TContext } from './router.interface';

export async function oMiddle <T = Koa.Middleware | Express > (
    type: 'express' | 'koa', callback: IOapi, options: TAnyObj = { }
): Promise<T> {
    if (type === 'koa') {
        let r: any = async (ctx: TContext, next: Koa.Next): Promise<any> => {
            try {
                let result = await callback.verifyToken(ctx, options);
                if (result.ACTIVE === false) {
                    throw new Error('token verify fail');
                }

                await next();
            } catch (err: any) {
                let _err: IError = err;
                _err.state = 403;
                ctx.body = JSON.parse(err.response.body);
            }
        };

        return r;
    } else if (type === 'express') {
        let r: any = async (req: any, res: any, next: any) => {
            try {
                let result = await callback.verifyToken(<any> {
                    headers: { authorization: req.headers.authorization }
                }, options);
                if (result.ACTIVE === false) {
                    throw new Error('token verify fail');
                }

                await next();
            } catch (err: any) {
                if (!!err.response) {
                    let errBody = JSON.parse(err.response.body);
                    res.status(403).json(errBody);
                } else {
                    res.status(500).json({ message: err.message });
                }

                res.end();
            }
        };

        return r;
    } else {
        throw new Error('Unkowns type');
    }
}
