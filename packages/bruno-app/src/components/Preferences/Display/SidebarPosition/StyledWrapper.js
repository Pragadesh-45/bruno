import styled from 'styled-components';

const StyledWrapper = styled.div`
  .bruno-form {
    width: 100%;

    input[type='radio'] {
      margin-right: 0.375rem;
    }

    label {
      font-size: 0.875rem;
      color: ${(props) => props.theme.text};
    }
  }
`;

export default StyledWrapper;