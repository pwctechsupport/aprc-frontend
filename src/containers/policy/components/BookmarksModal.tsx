import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { oc } from "ts-optchain";
import {
  useBookmarkPoliciesQuery,
  useDestroyBookmarkPolicyMutation
} from "../../../generated/graphql";
import { toggleModal } from "../../../redux/modal";
import { useSelector } from "../../../shared/hooks/useSelector";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";

const BookmarksModal = () => {
  const modal = useSelector(state => state.modal.bookmark);
  const dispatch = useDispatch();
  const handleToggle = () => dispatch(toggleModal("bookmark"));

  const bookmarkPoliciesQ = useBookmarkPoliciesQuery();
  const bookmarks = oc(bookmarkPoliciesQ).data.bookmarkPolicies.collection([]);

  const [deleteBookmark] = useDestroyBookmarkPolicyMutation({
    onCompleted: _ => toast.success("Deleted"),
    onError: _ => toast.error("Delete failed"),
    refetchQueries: ["bookmarkPolicies"],
    awaitRefetchQueries: true
  });

  return (
    <Modal isOpen={modal} toggle={handleToggle}>
      <ModalHeader>Bookmarked Policies</ModalHeader>
      <ModalBody>
        <div>
          {bookmarks.map(bookmark => {
            return (
              <div
                key={bookmark.id}
                className="d-flex justify-content-between align-items-center py-3"
              >
                <Link to={`/policy/${bookmark.policyId}`}>
                  <div>{bookmark.policyId}</div>
                </Link>
                <FaTrash
                  onClick={() =>
                    deleteBookmark({ variables: { id: bookmark.id } })
                  }
                  className="text-red clickable"
                />
              </div>
            );
          })}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default BookmarksModal;
