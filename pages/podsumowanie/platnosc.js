import React, { useContext } from 'react'
import styled from 'styled-components';
import { OrderCheckoutItems } from '../../src/components/OrderCheckoutItems/OrderCheckoutItems';
import { OrderCheckoutPayment } from '../../src/components/OrderCheckoutPayment/OrderCheckoutPayment';
import { UserContext } from '../../src/context/UserContext';
import { MainTemplate } from '../../src/templates/MainTemplate'

const Wrapper = styled.div`
  display: flex;
  gap:30px;
  @media (max-width:992px) {
      flex-direction:column-reverse
    }

  & > div:first-of-type {
    width: 70%;
    @media (max-width:992px) {
      width: 100%;
    }
  }
`;

const Payment = () => {
  const { cart,addresses,user } = useContext(UserContext);

  if (!cart || !addresses) return "Loading..";

  return (
    <MainTemplate>
      <Wrapper>
         <OrderCheckoutPayment cart={cart} user={user} addresses={addresses}/>
         <OrderCheckoutItems isPayment cart={cart} />
      </Wrapper>
    </MainTemplate>
  )
}

export default Payment