export interface BlockHeader {
  currentVersion: number;
  hashPrevBlock: string;
  time: number;
  bits: string;
  version: number;
  nonce: number;
  hashMerkleRoot: string;
  isNull: boolean;
  blockTime: Date;
}

export interface AdditionalInformation {
  blockId: string;
  blockHeader: BlockHeader;
  height: number;
  confirmations: number;
  medianTimePast: Date;
  blockTime: Date;
}

export interface Header {
  currentVersion: number;
  hashPrevBlock: string;
  time: number;
  bits: string;
  version: number;
  nonce: number;
  hashMerkleRoot: string;
  isNull: boolean;
  blockTime: Date;
}

export interface Block {
  blockSize: number;
  transactionIds: string[];
  headerOnly: boolean;
  header: Header;
}

export interface BlockItem {
  additionalInformation: AdditionalInformation;
  block: Block;
}


