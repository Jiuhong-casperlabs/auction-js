import {
  DeployUtil,
  CasperClient,
  RuntimeArgs,
  CLMap,
  CLList,
  CLKey,
  CLAccountHash,
  CLString,
  CLPublicKey,
  CLOption,
} from "casper-js-sdk";
import * as utils from "./utils";
import { Some, None } from "ts-results";
import * as constants from "./constants";

const main = async () => {
  //Step 1: Set casper node client
  const client = new CasperClient(constants.DEPLOY_NODE_ADDRESS);

  //Step 2: Set contract operator key pair
  const keyPairofContract = utils.getKeyPairOfContract(
    constants.PATH_TO_SOURCE_KEYS
  );

  //Step4: get contract hash
  const constracthash_str =
    "hash-adc92723c7e7cd599d84352d1c13f4240686532ab88c1cd6365973c0ddbcbb1d";
  const contractHashAsByteArray = [
    ...Buffer.from(constracthash_str.slice(5), "hex"),
  ];

  // recipient
  const hexString =
    "01cec85e263f49e660ae853b30849a0205e763ea35f644c69d4b05f02a4606afaf";
  const hash = CLPublicKey.fromHex(hexString).toAccountHash();

  const accounthash = new CLAccountHash(hash);
  const recipient = new CLKey(accounthash);

  const a = new CLString("orange");
  const myList = new CLList([a]);
  const token_ids = new CLOption(Some(myList));

  // nctl-view-user-account user=6
  const token1_myKey1 = new CLString("ice_account");
  const token1_myVal1 = new CLString(
    "account-hash-9f3e78530d55f5ec09d6b331127744d9abe6142276bf0728b69348d55d053e21"
  );
  const token1_myKey2 = new CLString("ice_rate");
  const token1_myVal2 = new CLString("2");
  const token1_commission = new CLMap([
    [token1_myKey1, token1_myVal1],
    [token1_myKey2, token1_myVal2],
  ]);
  const token_metas = new CLList([token1_commission]);
  const token_commissions = new CLList([token1_commission]);

  //Step 5: Invoke contract transfer endpoint.

  //Step 5.1 Set deploy
  let deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(
      keyPairofContract.publicKey,
      constants.DEPLOY_CHAIN_NAME,
      constants.DEPLOY_GAS_PRICE,
      constants.DEPLOY_TTL_MS
    ),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      contractHashAsByteArray,
      "mint",
      RuntimeArgs.fromMap({
        recipient: recipient,
        token_ids: token_ids,
        token_metas: token_metas,
        token_commissions: token_commissions,
      })
    ),
    DeployUtil.standardPayment(
      constants.DEPLOY_GAS_PAYMENT_FOR_SESSION_TRANSFER
    )
  );

  //Step 5.2 Sign deploy.
  deploy = client.signDeploy(deploy, keyPairofContract);

  //Step 5.3 Dispatch deploy to node.
  let deployHash = await client.putDeploy(deploy);

  console.log(`deploy hash = ${deployHash}`);
};

main();
