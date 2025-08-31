//@ts-check
import { useLocalStorageState } from "../../hook/useLocalStorageState.js";

/**
 * @typedef Account
 * @property {string} id
 */

/**
 * 将来的にアカウント単位で値 (設定等) を保存するときを見越して
 *
 * @returns { [() => null | Account, (account: Account)=> void] }
 */
export const useAccount = () => {
  const id = crypto.randomUUID().replace("-", "");
  const [account, setAccount] = useLocalStorageState("accounts", { id: id });
  return [
    account,
    (account) => {
      setAccount(account);
    },
  ];
};
