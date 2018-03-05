import { ApolloClient } from 'apollo-client';
import { Component } from 'react';
import {UrlWithParsedQuery} from 'url';

export interface ParsedUrlQuery {
  [key: string]: string | string[];
}
export interface NextJSPageProps {
  url?: ParsedUrlQuery;
}

export interface NextJSPageContext {
  query: ParsedUrlQuery;
  pathname: string;
  isServer: boolean;
  apollo: ApolloClient<any>;
}

export class NextJSPage extends Component<NextJSPageProps, any> {
  public displayName?: string;
  public name?: string;

  public async getInitialProps(ctx: any): Promise<any> {
    return {};
  }
}
