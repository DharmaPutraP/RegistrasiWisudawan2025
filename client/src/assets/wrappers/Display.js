import styled from "styled-components";

const Wrapper = styled.aside`
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }

  .overlay-text {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #000;
    z-index: 1;
    pointer-events: none;
  }

  h2 {
    font-family: "Courgette", cursive;
    font-weight: 400;
    font-size: 3rem;
    margin-bottom: 20px;
  }

  .container {
    position: relative;
  }
  .left-vector,
  .right-vector {
    position: absolute;
    top: 20%;
    transform: translateY(-50%);
    height: auto;
  }
  .left-vector {
    width: 2.5rem;
    left: 12rem;
    /* Position left */
  }

  .right-vector {
    width: 6rem;
    right: 7rem;
    /* Position right */
  }
  h1 {
    font-family: "Bowlby One SC", sans-serif;
    font-weight: 400;
    color: #3955af;
    font-size: 4.5rem;
  }
  .displayName {
    font-family: "Cormorant Garamond", serif;
    font-weight: 700;
    color: #3955af;
    font-size: 4rem;
  }
  @media (min-width: 769px) {
    h2 {
      font-size: 2.5rem;
    }
    h1 {
      font-size: 3.1rem;
    }
    .displayName {
      font-size: 3.7rem;
    }
  }
  @media (min-width: 1025px) {
    h2 {
      font-size: 3.5rem;
    }
    h1 {
      font-size: 4.5rem;
    }
    .displayName {
      font-size: 5rem;
    }
  }

//   @media (min-width: 1441px) {
//     h2 {
//       font-size: 5rem;
//     }
//     h1 {
//       font-size: 7.3rem;
//     }
//     .displayName {
//       font-size: 8rem;
//     }
//     .left-vector {
//       width: 4rem;
//       left: -3rem;
//     }
//     .right-vector {
//       width: 10rem;
//       right: -11rem;
//     }
  /* } */
`;
export default Wrapper;
