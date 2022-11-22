import React from 'react';

import '../common/styles.css';
import '../../styles/base.scss';
import {
  Box,
  Button,
  Grid,
  HelpPanel,
  SpaceBetween
} from "@cloudscape-design/components";
import {Navigation} from "../common/navigation";
import {CustomAppLayout} from "../common/app-layout";
import Input from "@cloudscape-design/components/input";
import {storeToken} from "../../redux/actions";

import {Auth} from "aws-amplify";
import {useHistory} from "react-router-dom";
import {useDispatch} from "react-redux";

export default class LoginView extends React.Component {
  render() {
    return (
        <CustomAppLayout
            navigation={<Navigation activeHref="/"/>}
            navigationOpen={false}
            content={<LoginContent />}
            contentType="default"
            tools={<ToolsContent />}
            toolsHide={false}
            // labels={appLayoutNavigationLabels}
        />

    );
  }
}

export const ToolsContent = () => (
    <HelpPanel
        header={<h2>Cross Region Failover</h2>}
        footer={
          <>
          </>
        }
    >
      <p>
        This solution demonstrates how to failover a sample remittance application across AWS regions.
      </p>
    </HelpPanel>
);

// The content in the main content area of the App layout
export function LoginContent() {

  const history = useHistory();
  const dispatch = useDispatch();

  const [user, setUser] = React.useState("");
  const [password, setPassword] = React.useState("");

  const login = () => {
    try {
      Auth.signIn(user, password).then(
        (result) => {
          Auth.currentAuthenticatedUser()
            .then((data) => {
              dispatch(storeToken(data.signInUserSession.idToken["jwtToken"]))
              history.push("/");
            });
        });
    } catch (error) {
      console.log("Got error in login function");
      console.log(error);
    }
  }

  return (
      <div>
        <Box margin={{ bottom: 'l' }}>
          <div className="back_ground_black">
            <Box padding={{ vertical: 'xxl', horizontal: 's' }}>
              <Grid
                  gridDefinition={[
                    { colspan: { xl: 6, l: 5, s: 10, xxs: 10 }, offset: { l: 2, xxs: 1 } }
                  ]}
              >
                <div className="text_white">
                  <SpaceBetween size="xl">
                    <Box variant="h1" fontWeight="bold" padding="n" fontSize="display-l" color="inherit">
                      Cross Region Failover
                    </Box>
                    <Box variant="h3" fontWeight="bold">
                      <span className="text_white">
                        This solution demonstrates how to failover a sample remittance application across AWS regions.
                      </span>
                    </Box>
                    <Box>
                      <Button disabled="true" href="/Remittances" variant="primary">Open Remittance Dashboard</Button>
                    </Box>
                  </SpaceBetween>
                </div>

              </Grid>
            </Box>
          </div>
          <div className="border_black">
            <Box margin={{ top: 's' }} padding={{ top: 'xxl', horizontal: 's' }}>
              <Grid
                  gridDefinition={[
                    { colspan: 4, offset: 4 }
                  ]}
              >
                <div className="border_black">
                  <Box margin={{ top: 's', bottom: 'xl' }} padding={{ top: 'xl',  horizontal: 'xl' }}>
                  <SpaceBetween size="xl">
                    <div>
                      <Box fontSize="heading-m" fontWeight="normal" variant="h3">
                        User Name:

                        <Input onChange={({ detail }) => setUser(detail.value)}
                            value={user}
                        />
                      </Box>
                    </div>

                    <div>
                      <Box fontSize="heading-m" fontWeight="normal" variant="h3">
                        Password:

                        <Input type="password" onChange={({ detail }) => setPassword(detail.value)}
                               value={password}
                        />

                      </Box>
                    </div>

                    <div>
                      <Box>
                        <Button onClick={({ detail }) => login()} variant="primary">Login</Button>
                      </Box>
                    </div>

                  </SpaceBetween>
                  </Box>
                </div>

              </Grid>
            </Box>
            <Box margin={{ top: 's' }} padding={{ top: 'xxl', horizontal: 's' }}>
            </Box>
          </div>
        </Box>

      </div>
  );
}



