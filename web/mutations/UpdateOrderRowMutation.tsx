import gql from 'graphql-tag';
import {print as printSource} from 'graphql/language/printer';
import { APIOrder, APIOrderRow, ID_Input, UpdateOrderRowVariables } from 'lib/prisma';
import React, { ReactNode } from 'react';
import { compose, graphql, QueryProps } from 'react-apollo';
import { GetOrderFragment } from '../queries/GetOrderQuery';
import { calculateTotals } from './addProductToOrder';

export interface Props {
  className?: string;
  children: ReactNode;
  order: Partial<APIOrder>;
  variables: UpdateOrderRowVariables;
  redirect: string;
  updateOrderRowMutation?: () => {};
  style?;
}

export function orderReducerUpdateOrderRow(order: Partial<APIOrder>, variables: UpdateOrderRowVariables) {
  const newOrder = {
    ...order,
    rows: order.rows.reduce((rows, row) => {
      if (row.id !== variables.id) {
        return [...rows, row];
      }
      if (variables.quantity < 1) {
        // row deleted!
        return rows;
      }
      return [...rows, {...row, ...variables}];
    }, []),
  };

  return calculateTotals(newOrder);
}

export const updateOrderRowQuery: any = gql`
  mutation updateOrderRow ($id: ID! $quantity: Int) {
    updateOrderRow (id: $id quantity: $quantity) {
      order {
        ...GetOrderFragment
      }
    }
  }
  ${GetOrderFragment}
`;

export const UpdateOrderRow = ({ children, redirect, variables, updateOrderRowMutation, style }: Props) => (
  <form
    action={'/_gql/m'}
    style={style}
    method="post"
    onSubmit={(e) => {
      e.preventDefault();

      updateOrderRowMutation();
    }}
    >
      <input type="hidden" name="query" value={printSource(updateOrderRowQuery)} />
      <input type="hidden" name="redirect" value={redirect} />
      <input type="hidden" name="variables" value={JSON.stringify(variables)} />
      {children}
  </form>
);

export const updateOrderRowGraphQL = graphql<Response, Props>(updateOrderRowQuery, {
  props: (props) => ({
    updateOrderRowMutation: () => {
      const {order, variables} = props.ownProps;
      return props.mutate({
        variables,
        optimisticResponse: ({
          __typename: 'Mutation',
          updateOrderRow: {
            __typename: 'OrderRow',
            order: orderReducerUpdateOrderRow(order, variables),
          },
        }),
      });
    },
  }),
});

export default updateOrderRowGraphQL(UpdateOrderRow);
