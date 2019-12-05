import React from 'react';
import { oc } from 'ts-optchain';
import { useReferencesQuery, useDestroyReferenceMutation } from '../../generated/graphql';
import Table from '../../shared/components/Table';
import CreateReference from './CreateReference';
import { Button } from 'reactstrap';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const References = () => {
  const { data, loading } = useReferencesQuery()
  const [destroyReference] = useDestroyReferenceMutation({
    refetchQueries: ['references'],
    onCompleted: () => toast.success('Delete Success'),
    onError: () => toast.error('Delete Failed')
  })

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1>References</h1>
      </div>

      <div>
        <CreateReference/>
      </div>

      <Table loading={loading}>
        <thead>
          <tr>
            <th>Name</th>
            <th/>
          </tr>
        </thead>
        <tbody>
          {oc(data).references.collection([]).map(reference => {
            return (
              <tr key={reference.id}>
                <td>{reference.name}</td>
                <td>
                  <Button
                    onClick={() => destroyReference({variables: {id: reference.id}})}
                    color="transparent"
                  >
                    <FaTrash/>
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )
}

export default References