## Architecture

### EventStoreWriter

The EventStoreWriter is an encrypted store for your private note information as well as your keypair. This data is encrypted with AES-256 and stored in indexDB in the browser and [keyv](keyvhq.js.org) storage strategies are possible serverside (ie. MySQL, PostgreSQL, SQLite, Redis, Mongo, DynamoDB, Firestore, Memcached, and more).

```mermaid

classDiagram
    note for EventStoreWriter "- Facade / Coordinator for Utxo storage"

    class EventStoreWriter
    EventStoreWriter: -encryptor
    EventStoreWriter: -keypair
    EventStoreWriter: start()
    EventStoreWriter: stop()
    EventStoreWriter: isStarted()
    EventStoreWriter: getNotesUpTo(amount) Note[]
    EventStoreWriter: get(id)
    EventStoreWriter: getAll()

    note for UtxoEventDecryptor "- Listens for historical and current contract events\n- Manages event cursor storing events in the store\n- Filters events decryptable by keypair\n"

    class UtxoEventDecryptor
    UtxoEventDecryptor: -contract
    UtxoEventDecryptor: -keypair
    UtxoEventDecryptor: -lastEvent
    UtxoEventDecryptor: start()
    UtxoEventDecryptor: stop()
    UtxoEventDecryptor: isStarted()
    UtxoEventDecryptor: onDecryptedUtxo(handler)
    UtxoEventDecryptor: onNullifier(handler)

    note for PasswordEncryptor "PasswordEncryptor enables user to e2e encrypt their utxo store and keypair"

    class PasswordEncryptor
    PasswordEncryptor: -hash
    PasswordEncryptor: +fromPassword(password)$

    class Store
    Store: getAll()
    Store: get(id)
    Store: add(id, item)
    Store: remove(id)
    Store: removeAll()

    class EncryptedStore
    EncryptedStore: Encryptor encryptor
    EncryptedStore: Store backend

    class IndexDBStore

    Store <|-- EncryptedStore
    Store <|-- IndexDBStore

    note for Keypair "- Acts as identity keys for asset storage\n- Derived from a message signed with their wallet"

    class Keypair
    Keypair: privateKey
    Keypair: publicKey
    Keypair: encryptionKey
    Keypair: encrypt(data)
    Keypair: decrypt(data)
    Keypair: sign(commitment,merklepath)
    Keypair: +generate()$
    Keypair: +fromSigner(signer)$
    Keypair: +fromString(string)$

    EventStoreWriter ..> EncryptedStore
    EncryptedStore ..> IndexDBStore
    EventStoreWriter ..> UtxoEventDecryptor


```
