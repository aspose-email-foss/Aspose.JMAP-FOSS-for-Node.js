// Auto-generated composition file (template-rendered, not an LLM task).
// Wires together the per-module client mixins produced by the codegen pipeline.

import { JmapClient as CoreClient } from "./client-core.js";
import { MailClientMixin } from "./client-mail.js";
import { SubmissionClientMixin } from "./client-submission.js";

class JmapClient extends CoreClient {}

Object.assign(JmapClient.prototype, MailClientMixin);
Object.assign(JmapClient.prototype, SubmissionClientMixin);

export { JmapClient };
export { SetError, MethodError, ResultReference, JmapError, JmapProtocolError, JmapNetworkError } from "./models/CommonTypes.js";
export { Session, Account, CoreCapability } from "./models/Session.js";
export { Invocation } from "./models/Invocation.js";
export { JmapRequestEnvelope } from "./models/JmapRequestEnvelope.js";
export { JmapResponseEnvelope } from "./models/JmapResponseEnvelope.js";
export { Mailbox, MailboxRights } from "./models/Mailbox.js";
export { EmailAddress } from "./models/EmailAddress.js";
export { EmailAddressGroup } from "./models/EmailAddressGroup.js";
export { EmailBodyPart } from "./models/EmailBodyPart.js";
export { EmailHeader } from "./models/EmailHeader.js";
export { Email, EmailBodyValue } from "./models/Email.js";
export { Thread } from "./models/Thread.js";
export { Identity } from "./models/Identity.js";
export { Comparator } from "./models/Comparator.js";
export { EmailQueryResponse } from "./models/EmailQueryResponse.js";
export { SearchSnippet } from "./models/SearchSnippet.js";
export { Envelope, Address } from "./models/Envelope.js";
export { DeliveryStatus } from "./models/DeliveryStatus.js";
export { EmailSubmission } from "./models/EmailSubmission.js";
