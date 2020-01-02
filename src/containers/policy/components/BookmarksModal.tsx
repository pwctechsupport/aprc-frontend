import React from "react";
import { FaTrash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import styled from "styled-components";
import { oc } from "ts-optchain";
import {
  useBookmarkBusinessProcessesQuery,
  useBookmarkPoliciesQuery,
  useDestroyBookmarkBusinessProcessMutation,
  useDestroyBookmarkPolicyMutation
} from "../../../generated/graphql";
import { toggleModal } from "../../../redux/modal";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { useSelector } from "../../../shared/hooks/useSelector";

const BookmarksModal = () => {
  const modal = useSelector(state => state.modal.bookmark);
  const dispatch = useDispatch();
  const handleToggle = () => dispatch(toggleModal("bookmark"));

  return (
    <Modal isOpen={modal} toggle={handleToggle}>
      <BookmarkContent toggle={handleToggle} />
    </Modal>
  );
};

export default BookmarksModal;

const BookmarkContent = ({ toggle }: { toggle: () => void }) => {
  const history = useHistory();
  const bookmarkPoliciesQ = useBookmarkPoliciesQuery({
    fetchPolicy: "network-only"
  });
  const bookmarkBpsQ = useBookmarkBusinessProcessesQuery({
    fetchPolicy: "network-only"
  });
  const bps = oc(bookmarkBpsQ).data.bookmarkBusinessProcesses.collection([]);
  const policies = oc(bookmarkPoliciesQ).data.bookmarkPolicies.collection([]);

  const [deletePolBookmark] = useDestroyBookmarkPolicyMutation({
    onCompleted: _ => toast.success("Deleted"),
    onError: _ => toast.error("Delete failed"),
    refetchQueries: ["bookmarkPolicies"],
    awaitRefetchQueries: true
  });
  const [deleteBpBookmark] = useDestroyBookmarkBusinessProcessMutation({
    onCompleted: _ => toast.success("Deleted"),
    onError: _ => toast.error("Delete failed"),
    refetchQueries: ["bookmarkBusinessProcesses"],
    awaitRefetchQueries: true
  });

  return (
    <>
      <ModalHeader>Bookmarks</ModalHeader>
      {bookmarkPoliciesQ.loading ? (
        <LoadingSpinner centered size={30} className="my-5" />
      ) : (
        <ModalBody>
          <div>
            {policies.length ? (
              <>
                <BookmarkSectionTitle>Policies</BookmarkSectionTitle>
                {policies.map(bookmark => {
                  return (
                    <BookmarkItem
                      key={bookmark.id}
                      name={oc(bookmark).policy.title("")}
                      onClick={() => {
                        history.push(`/policy/${oc(bookmark).policy.id("")}`);
                        toggle();
                      }}
                      onDelete={() =>
                        deletePolBookmark({ variables: { id: bookmark.id } })
                      }
                    />
                  );
                })}
              </>
            ) : (
              <div className="text-center my-5">No Bookmarked Policy</div>
            )}
          </div>

          <div>
            {bps.length ? (
              <>
                <BookmarkSectionTitle>Business Processes</BookmarkSectionTitle>
                {bps.map(bookmark => (
                  <BookmarkItem
                    key={bookmark.id}
                    name={oc(bookmark).businessProcess.name("")}
                    onClick={() => {
                      history.push(
                        `/risk-and-control/${oc(bookmark).businessProcess.id(
                          ""
                        )}`
                      );
                      toggle();
                    }}
                    onDelete={() =>
                      deleteBpBookmark({ variables: { id: bookmark.id } })
                    }
                  />
                ))}
              </>
            ) : (
              <div className="text-center my-5">
                No Bookmarked Business Processes
              </div>
            )}
          </div>
        </ModalBody>
      )}
    </>
  );
};

const BookmarkItem = ({ name, onDelete, onClick }: BookmarkItemProps) => (
  <BookmarkItemWrapper onClick={onClick}>
    <div>{name}</div>
    <DeleteIcon
      onClick={(e: React.MouseEvent<SVGElement, MouseEvent>) => {
        e.stopPropagation();
        onDelete();
      }}
    />
  </BookmarkItemWrapper>
);

const BookmarkItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;
const DeleteIcon = styled(FaTrash)`
  visibility: hidden;
  color: red;
  cursor: pointer;
  ${BookmarkItemWrapper}:hover & {
    visibility: visible;
  }
`;
const BookmarkSectionTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-top: 15px;
  &:first-child {
    margin-top: 15px;
  }
`;

interface BookmarkItemProps {
  name: string;
  onDelete: () => void;
  onClick: () => void;
}
