import {
  DeployUtil,
  CasperClient,
  RuntimeArgs,
  CLMap,
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
    constants.PATH_TO_KYC_KEYS
  );

  //Step4: get contract hash
  const constracthash_str =
    "hash-a1fb32f330214b638e926e3c6fc8a2b1a9d94e20f3eae5a15685409778a9b90e";
  const contractHashAsByteArray = [
    ...Buffer.from(constracthash_str.slice(5), "hex"),
  ];

  // recipient
  const hexString =
    "010ce51039a7bf51e5b8d5afe40b7a221c9c37e1b1a8567c587d455b6a6394ec78";
  const hash = CLPublicKey.fromHex(hexString).toAccountHash();

  const accounthash = new CLAccountHash(hash);
  const recipient = new CLKey(accounthash);

  const a = new CLString("apple");
  const token_id = new CLOption(Some(a));

  const myKey = new CLString("status");
  const myVal = new CLString("active");
  const token_meta = new CLMap([[myKey, myVal]]);

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
        token_id: token_id,
        token_meta: token_meta,
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
