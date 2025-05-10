import { getModelForClass, index,  prop } from '@typegoose/typegoose';
import { EVENT_MODEL_TITLE } from '../config';


@index({contractAddress: 1, transactionHash:1},{unique: true})
@index({integrator: 1})
class Event{
    @prop({required: true, type: String})
    contractAddress!: string;

    @prop({required: true, type: String})
    token!: string;
    
    @prop({required: true, type: String})
    integrator!: string;
    
    @prop({type: String, required: true})
    integratorFee!: string;
    
    @prop({type: String, required: true})
    lifiFee!: string;

    @prop({type: String, required: true})
    transactionHash!: string;
}

export const EventModel = (chainId: number)=>{
    const m= getModelForClass(Event,{schemaOptions:{timestamps: true,collection: EVENT_MODEL_TITLE + "_"+ chainId}})
    m.createIndexes({background: true});
    return m
} 
 
