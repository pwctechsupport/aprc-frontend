import React from "react";
import { Link } from "react-router-dom";
import StarRatingComponent from "react-star-rating-component";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useUpdateResourceRatingMutation } from "../../generated/graphql";
import { useSelector } from "../hooks/useSelector";

const ResourceBar = (props: ResourceBarProps) => {
  const user = useSelector(state => state.auth.user);
  const [mutate] = useUpdateResourceRatingMutation({
    onCompleted: () => toast.success("Update Rating Sucess"),
    onError: () => toast.error("Update Rating Failed"),
    awaitRefetchQueries: true,
    refetchQueries: ["policy"]
  });
  const handleStarClick = (nextValue: number) => {
    mutate({
      variables: {
        input: {
          id: props.resourceId,
          rating: nextValue,
          userId: oc(user).id("")
        }
      }
    });
  };
  return (
    <div className="resource-bar">
      <Link to={`/resources/${props.resourceId}`}>
        <div className="name">{props.name}</div>
      </Link>
      <div>{props.rating}</div>

      <div className="star-and-views">
        <StarRatingComponent
          name={props.name}
          value={props.rating || 2}
          starCount={5}
          onStarClick={handleStarClick}
          starColor="#d85604"
        />
        <div className="views">{props.visit} Views</div>
      </div>
    </div>
  );
};

export default ResourceBar;

interface ResourceBarProps {
  resourceId: string;
  name: string;
  rating?: number | undefined | null;
  visit?: string | number;
}
