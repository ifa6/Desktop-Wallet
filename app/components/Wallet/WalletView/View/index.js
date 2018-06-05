import React, { Component } from "react";
import { NavLink, withRouter } from "react-router-dom";
import { FormattedDate, FormattedNumber, FormattedTime } from "react-intl";
import { connect } from "react-redux";
import styles from "./ViewTransaction.css";
import DarkMainModal from "../../../Content/DarkMainModal";
import { TopRightArrow, WalletIcon } from "../../../Icons";
import { updateTransactions } from "../../../../actions/wallet";

import { dropsToTrx, dropsToFiat } from "../../../../utils/currency";

class ViewTransaction extends Component {
  state = {}
  renderHeaderAmount() {
    let { tx } = this.state;
    console.log(tx)
    if (tx.frozen_balance) {
      return (
        <div className={styles.headerAmount}>
          <FormattedNumber value={dropsToTrx(tx.frozen_balance)} />{' ' + tx.asset}
        </div>
      )
    }
    if (tx.contract_desc === "VoteWitnessContract") {
      return (
        <div className={styles.headerAmount}>
          <FormattedNumber value={tx.votes[0].vote_count} /> TP
        </div>
      )
    }
    if (tx.contract_desc === "ParticipateAssetIssueContract") {
      console.log(tx.amount_tokens)
      return (
        <div className={styles.headerAmount}>
          <FormattedNumber value={tx.amount_tokens} /> { tx.asset }
        </div>
      )
    }
    if (tx.contract_desc === "AssetIssueContract") {
      return (
        <div className={styles.headerAmount}>
          <FormattedNumber value={tx.total_supply} /> { tx.name }
        </div>
      )
    }
    if (tx.amount) {
      if (tx.asset === "TRX") {
        return (
          <div className={styles.headerAmount}>
            <FormattedNumber value={tx.amount / 1000000} />{' ' + tx.asset}
          </div>
        )
      }
      return (
        <div className={styles.headerAmount}>
          <FormattedNumber value={tx.amount} />{' ' + tx.asset}
        </div>
      )
    }
    return (
      <div className={styles.headerAmount}>
        {
          tx.asset === "TRX" ?
            <FormattedNumber value={tx.amount / 1000000} />
          :
            <FormattedNumber value={tx.amount} />
        }{' ' + tx.asset}
      </div>
    )
  }

  render() {
    let accountId = this.props.match.params.account;
    let txID = this.props.match.params.txid;
    let account = this.props.wallet.persistent.accounts[accountId];
    if (!account) {
      this.props.history.push("/wallets/walletDetails/" + accountId);
      return <div />;
    }
    let transactions = account.transactions;

    let tx = transactions.find(tx => tx._id === txID);

    let usdValue = dropsToFiat(this.props.currency, tx.amount || 0);
    if (tx.asset !== "TRX") {
      let token = this.props.tokens.find(token => token.name === tx.asset);
      usdValue = dropsToFiat(this.props.currency, tx.amount * token.trx_num);
    }

    this.state.tx = tx;

    return (
      <DarkMainModal className={styles.container}>
        <div className={`${styles.subContainer} ${this.props.className}`}>
          <div className={styles.headerBG}>
            <TopRightArrow
              className={
                tx.type === 0
                  ? styles.headerIcon
                  : `${styles.headerIcon} ${styles.rotate}`
              }
            />
            <div className={styles.headerType}>
              {tx.type === 0 ? "Sent" : "Received"} :
            </div>
            { this.renderHeaderAmount() }
            <div className={styles.headerCurrency}>{usdValue} USD</div>
          </div>
          <div className={styles.tokenInfoContainer}>
            <div className={styles.tokenHeader}>Fee :</div>
            <div className={styles.feeContainer}>
              <div className={styles.feeAmount}>
                <FormattedNumber value={tx.txsize} /> Bandwidth
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.tokenHeader}>
              {tx.type === 0 ? "Sent to" : "Received From"} :
            </div>
            <div className={styles.tokenHeaderText}>{tx.owner_address}</div>
            <div className={styles.divider} />
            <div className={styles.tokenHeader}>
              {tx.type === 0 ? "Sent From" : "Received in"} :
            </div>
            <div className={styles.walletContainer}>
              <WalletIcon className={styles.walletIcon} />
              <div>{this.props.wallet.persistent.accounts[accountId].name}</div>
            </div>
            <div className={styles.divider} />
            <div className={styles.tokenHeader}>Date :</div>
            <div className={styles.tokenHeaderText}>
              <FormattedDate value={tx.date} />{" "}
              <FormattedTime value={tx.date} />
            </div>
          </div>
        </div>
      </DarkMainModal>
    );
  }
}

export default withRouter(
  connect(
    state => ({ wallet: state.wallet, currency: state.currency, tokens: state.tokens.tokens }),
    dispatch => ({
      updateTransactions: (accountId, transactions) => {
        dispatch(updateTransactions(accountId, transactions));
      }
    })
  )(ViewTransaction)
);
