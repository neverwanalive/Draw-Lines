import styled from "styled-components";

export const Main = styled.div`
  display: flex;
`;

export const Container = styled.div`
  width: ${({ width }) => width};
  ${({ marginTop }) =>
    marginTop &&
    `
    margin-top: ${marginTop};
    `}
`;
