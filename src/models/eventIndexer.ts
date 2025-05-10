import { getModelForClass, index, modelOptions, prop } from "@typegoose/typegoose";
import { EVENT_MODEL_INDEXER_TITLE } from "../config";

@modelOptions({schemaOptions:{collection:EVENT_MODEL_INDEXER_TITLE}})
@index({contractAddress: 1,chainId: 1},{unique: true})
@index({chainId: 1})
class EventIndexer{
    @prop({required: true, type: String})
    public contractAddress!: string;
    
    @prop({required: true,type: Number})
    public chainId!: number;
    
    @prop({type: String})
    public lastBlockId!: string;
}

export const EventIndexerModel = getModelForClass(EventIndexer,{schemaOptions:{timestamps: true}});
 
 
