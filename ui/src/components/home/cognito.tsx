import {Amplify, Auth} from "aws-amplify";
import React, { useEffect } from "react";
import {useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {ReduxRoot} from "../../interfaces";

function Cognito (props: any) {

  const history = useHistory();

  const amplifyConfig = {
    Auth: {
      mandatorySignIn: true,
      region: 'us-east-1',
      userPoolId: 'USER_POOL_ID_PLACEHOLDER',
      identityPoolId: 'IDENTITY_POOL_ID_PLACEHOLDER',
      userPoolWebClientId: 'WEB_CLIENT_ID_PLACEHOLDER',
      oauth: {
        domain: 'DOMAIN_PLACEHOLDER',
        redirectSignIn: 'http://d2ijcpbka8pfkz.cloudfront.net/',
        redirectSignOut: 'http://d2ijcpbka8pfkz.cloudfront.net/',
        responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
      }
    }
  };

  Amplify.configure(amplifyConfig);
  Auth.configure(amplifyConfig);

  const token = useSelector( (state:ReduxRoot) => {
    return state.reducerState.token
  });

  useEffect(() => {

    if (token === "") {
      history.push("/Login");
    }

  }, [history, token]);

  return (
      <div />
  );
}

export default Cognito;