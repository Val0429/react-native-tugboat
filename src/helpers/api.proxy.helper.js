import ApiService from '../service/api.service'


export class apiProxyHelper {

  constructor(

  ) { }

  /**: {
  url: string,
  method?: string,
  headers?: { [key: string]: string },
  body?: any
} */
  apiProxy(args) {

    const requestInit = {
      headers: args.headers ? args.headers : {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      method: args.method ? args.method : 'POST',
      body: JSON.stringify(args.body)
    };

     console.log('App Console : ',`${args.hostname}/${args.url}`);
    const proxy$ = fetch(`${args.hostname}/${args.url}`, requestInit);

    return proxy$;
  }
}

export default new apiProxyHelper();