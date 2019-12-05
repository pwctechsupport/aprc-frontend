import React, { useEffect } from "react";
import { Form } from "reactstrap";
import Input from "../../shared/components/forms/Input";
import useForm from "react-hook-form";
import { RHFInput } from "react-hook-form-input";
import Select from "react-select";
import Button from "../../shared/components/Button";
import { TypeOfControl, Frequency } from "../../generated/graphql";

const CreateControl = ({}: CreateControlProps) => {
  const { register, handleSubmit, setValue } = useForm<
    CreateControlFormValues
  >();
  const submit = (values: CreateControlFormValues) => {
    console.log("values:", values);
  };

  useEffect(() => {
    // register({ name: "typeOfControl" });
    // register({ name: "frequency" });
    // register({ name: "nature" });
    // register({ name: "assertion" });
    // register({ name: "ipo" });
  }, [register]);

  return (
    <div>
      <h1>Create control</h1>
      <Form onSubmit={handleSubmit(submit)}>
        <Input name="controlOwner" label="Control Owner" innerRef={register} />
        <Input name="fteEstimate" label="Fte Estimate" innerRef={register} />
        {/* <RHFInput
          as={<Select options={[]} />}
          rules={{ required: true }}
          name="typeOfControl"
          register={register}
          setValue={setValue}
        /> */}
        <RHFInput
          as={<Select options={options} />}
          // rules={{ required: true }}
          name="frequency"
          register={register}
          setValue={setValue}
        />
        <div className="d-flex justify-content-end">
          <Button className="pwc" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateControl;

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" }
];

interface CreateControlProps {}

interface CreateControlFormValues {
  controlOwner: string;
  typeOfControl: TypeOfControl;
  frequency: Frequency;
}
